// Video classes controller removed — feature deprecated.
// Exporting stub handlers to avoid import errors in other modules.

exports.createClass = async (req, res) => {
    res.status(410).json({ success: false, message: 'Video classes feature has been removed' });
};

exports.getTeacherClasses = async (req, res) => {
    res.status(410).json({ success: false, message: 'Video classes feature has been removed' });
};

exports.getEnrolledClasses = async (req, res) => {
    res.status(410).json({ success: false, message: 'Video classes feature has been removed' });
};

exports.updateClass = async (req, res) => {
    res.status(410).json({ success: false, message: 'Video classes feature has been removed' });
};

exports.deleteClass = async (req, res) => {
    res.status(410).json({ success: false, message: 'Video classes feature has been removed' });
};
