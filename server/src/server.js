const express = require('express');

const app = express();
const port = Number(process.env.PORT || 3000);
const protocolVersion = '2025-06-18';
const widgetUri = 'ui://widget/study-plan.html';

function getPublicUrl() {
	if (process.env.PUBLIC_URL) {
		return process.env.PUBLIC_URL.replace(/\/$/, '');
	}
	if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
		return `https://${process.env.CODESPACE_NAME}-${port}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
	}
	return `http://localhost:${port}`;
}

const publicUrl = getPublicUrl();

app.use(express.json());
app.use((request, response, next) => {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type, MCP-Protocol-Version');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	if (request.method === 'OPTIONS') {
		return response.sendStatus(204);
	}
	next();
});

app.get('/health', (request, response) => {
	response.json({ status: 'ok', publicUrl });
});

app.get('/', (request, response) => {
	response.sendFile('index.html', { root: `${__dirname}/../../web` });
});

app.get('/syllabus-data.js', (request, response) => {
	response.type('application/javascript').sendFile('syllabus-data.js', { root: `${__dirname}/../../web` });
});

const createStudyPlanTool = {
	name: 'create_study_plan',
	description: 'Create a daily study timetable for a government job exam.',
	_meta: {
		'openai/outputTemplate': widgetUri,
		'openai/widgetAccessible': true
	},
	inputSchema: {
		type: 'object',
		required: ['exam', 'hoursPerDay', 'subjects'],
		properties: {
			exam: { type: 'string' },
			hoursPerDay: { type: 'number', minimum: 1, maximum: 24 },
			targetDate: { type: 'string', description: 'Optional exam date in YYYY-MM-DD format.' },
			subjects: {
				oneOf: [
					{ type: 'string', description: 'Comma-separated subject names.' },
					{ type: 'array', items: { type: 'string' } }
				]
			}
		}
	}
};

const studyPlanResource = {
	uri: widgetUri,
	name: 'Study plan widget',
	description: 'Interactive study plan display for ChatGPT.',
	mimeType: 'text/html;profile=mcp-app'
};

function parseSubjects(subjects) {
	const values = Array.isArray(subjects) ? subjects : String(subjects || '').split(',');
	return values.map(subject => subject.trim()).filter(Boolean);
}

function createStudyPlan(argumentsObject) {
	const exam = String(argumentsObject.exam || '').trim();
	const hoursPerDay = Number(argumentsObject.hoursPerDay);
	const subjects = parseSubjects(argumentsObject.subjects);

	if (!exam || !Number.isFinite(hoursPerDay) || hoursPerDay <= 0 || subjects.length === 0) {
		throw new Error('exam, hoursPerDay, and subjects are required');
	}

	let examCountdownDays = null;
	if (argumentsObject.targetDate) {
		const target = new Date(`${argumentsObject.targetDate}T00:00:00Z`);
		if (Number.isNaN(target.getTime())) {
			throw new Error('targetDate must be a valid YYYY-MM-DD date');
		}
		const today = new Date();
		const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
		examCountdownDays = Math.max(0, Math.ceil((target.getTime() - todayUtc) / 86400000));
	}

	const subjectHours = hoursPerDay / subjects.length;
	const dailyTimetable = subjects.map((subject, index) => ({
		label: subject,
		durationHours: Number(subjectHours.toFixed(2)),
		order: index + 1
	}));

	return { exam, hoursPerDay, targetDate: argumentsObject.targetDate || null, examCountdownDays, subjects, dailyTimetable };
}

function jsonRpcError(id, code, message) {
	return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

app.post('/mcp', (request, response) => {
	const { id = null, method, params = {} } = request.body || {};

	if (method === 'initialize') {
		return response.json({
			jsonrpc: '2.0',
			id,
			result: {
				protocolVersion: params.protocolVersion || protocolVersion,
				capabilities: { tools: {} },
				serverInfo: { name: 'govt-jobs-study-planner', version: '1.0.0' }
			}
		});
	}

	if (method === 'notifications/initialized') {
		return response.status(202).end();
	}

	if (method === 'tools/list') {
		return response.json({ jsonrpc: '2.0', id, result: { tools: [createStudyPlanTool] } });
	}

	if (method === 'resources/list') {
		return response.json({ jsonrpc: '2.0', id, result: { resources: [studyPlanResource] } });
	}

	if (method === 'resources/read') {
		if (!params.uri || params.uri !== widgetUri) {
			return response.json(jsonRpcError(id, -32602, `Unknown resource: ${params.uri || ''}`));
		}
		return response.json({
			jsonrpc: '2.0',
			id,
			result: {
				contents: [{ uri: widgetUri, mimeType: studyPlanResource.mimeType, text: require('fs').readFileSync(`${__dirname}/../../web/index.html`, 'utf8') }]
			}
		});
	}

	if (method === 'tools/call') {
		if (!params.name || params.name !== createStudyPlanTool.name) {
			return response.json(jsonRpcError(id, -32602, `Unknown tool: ${params.name || ''}`));
		}
		try {
			const plan = createStudyPlan(params.arguments || {});
			return response.json({
				jsonrpc: '2.0',
				id,
				result: {
					structuredContent: plan,
					content: [{ type: 'text', text: JSON.stringify(plan) }]
				}
			});
		} catch (error) {
			return response.json({ jsonrpc: '2.0', id, result: { isError: true, content: [{ type: 'text', text: error.message }] } });
		}
	}

	return response.json(jsonRpcError(id, -32601, `Method not found: ${method || ''}`));
});

app.listen(port, () => {
	console.log(`Study planner listening on ${publicUrl}`);
});
