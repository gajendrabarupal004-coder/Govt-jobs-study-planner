(function () {
	const placeholderTopic = (id) => ({
		id,
		title: 'Official syllabus topics pending verification',
		subtopics: ['Add topics from the latest official notification'],
		status: 'not_started',
		completion: 0,
		important: false,
		notes: '',
		mcqCount: 0,
		pyqCount: 0,
		isPlaceholder: true
	});
	const planningSubjects = (examId, names) => names.map((name, index) => ({
		id: `${examId}-subject-${index + 1}`,
		name,
		topics: [placeholderTopic(`${examId}-topic-${index + 1}`)]
	}));
	const exam = (id, name, organization, subjects = []) => ({ id, name, organization, contentStatus: subjects.length ? 'planning-template' : 'official-content-pending', subjects });

	window.SYLLABUS_LIBRARY = {
		state: [
			exam('rajasthan-patwari', 'Rajasthan Patwari', 'RSSB', planningSubjects('rajasthan-patwari', ['Hindi', 'Maths', 'Reasoning', 'General Knowledge'])),
			exam('rajasthan-cet', 'Rajasthan CET', 'RSSB'),
			exam('rpsc-ras', 'RPSC RAS', 'RPSC'),
			exam('rajasthan-police', 'Rajasthan Police', 'Rajasthan Police'),
			exam('rajasthan-4th-grade', 'Rajasthan 4th Grade', 'RSSB'),
			exam('rajasthan-ldc', 'Rajasthan LDC', 'RSSB'),
			exam('reet', 'REET', 'BSER'),
			exam('junior-accountant', 'Junior Accountant', 'RSSB'),
			exam('other-rajasthan', 'Other Rajasthan government exams', 'Add a verified exam')
		],
		central: [
			exam('ssc-cgl', 'SSC CGL', 'Staff Selection Commission'),
			exam('ssc-chsl', 'SSC CHSL', 'Staff Selection Commission'),
			exam('ssc-mts', 'SSC MTS', 'Staff Selection Commission'),
			exam('ssc-gd', 'SSC GD', 'Staff Selection Commission'),
			exam('rrb-ntpc', 'RRB NTPC', 'Railway Recruitment Boards'),
			exam('rrb-group-d', 'RRB Group D', 'Railway Recruitment Boards'),
			exam('upsc', 'UPSC', 'Union Public Service Commission'),
			exam('banking', 'Banking exams', 'Add a verified exam'),
			exam('defence', 'Defence exams', 'Add a verified exam'),
			exam('other-central', 'Other central government exams', 'Add a verified exam')
		]
	};
}());
