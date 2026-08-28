import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const { schoolId, grade, category, search, gender } = req.query;
    let query = {};

    if (schoolId) {
      query.schoolId = schoolId;
    }

    if (grade) {
      query.applicableGrades = { $in: [grade, 'All Grades', 'Grade 1-12'] };
    }

    if (category) {
      query.category = category;
    }

    if (gender) {
      query.gender = { $in: [gender, 'Unisex'] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).populate('schoolId');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('schoolId');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8).populate('schoolId');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
