const express = require('express');
const { getDashboardKpis, getDashboardFilters } = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

router.use(auth);

router.get('/kpis', getDashboardKpis);
router.get('/filters', getDashboardFilters);

module.exports = router;
