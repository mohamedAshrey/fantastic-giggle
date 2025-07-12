require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const mongoose = require('mongoose');

const httpStatusText = require('./utils/httpStatusText');

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
    console.log('mongoDB server started');
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const usersRouters = require('./routes/users.route');
const blogsRouters = require('./routes/blogs.route');
const authRoutes = require('./routes/auth.route');
const contactRouter = require('./routes/contact.route');
const energyRouters = require('./routes/energySource.route');
const tipsRouters = require('./routes/tips.route');
const videoRouters = require('./routes/video.route');
const homeRouter = require('./routes/home.route');

app.use('/api/users', usersRouters);
app.use('/api/energy/blogs', blogsRouters);
app.use('/auth', authRoutes);
app.use('/api/contact', contactRouter);
app.use('/api/energy/source', energyRouters);
app.use('/api/energy/tips', tipsRouters);
app.use('/api/energy/videos', videoRouters);
app.use('/api/energy/videos', videoRouters);
app.use('/api/home', homeRouter);

app.all('*', (req, res, next) => {
    return res.status(404).json({
        status: httpStatusText.ERROR,
        data: null,
        message: 'This resource is not available',
    });
});

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        status: error.statusText || httpStatusText.ERROR,
        message: error.message,
        code: error.statusCode || 500,
        data: null,
    });
});

app.listen(process.env.PORT || 4000, () => {
    console.log('listening on port 4000');
});
