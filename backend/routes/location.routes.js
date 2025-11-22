const express = require('express');
const {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
} = require('../controllers/location.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const {
  createLocationValidator,
  updateLocationValidator,
  locationIdValidator
} = require('../validators/location.validator');

const router = express.Router();

router.use(auth);

router.get('/', getLocations);
router.get('/:id', locationIdValidator, validate, getLocationById);
router.post('/', createLocationValidator, validate, createLocation);
router.put('/:id', updateLocationValidator, validate, updateLocation);
router.delete('/:id', locationIdValidator, validate, deleteLocation);

module.exports = router;
