const Expense = require('../models/Expense');

// Add a new entry
exports.addExpense = async (req, res) => {
  try {
    const { userEmail, title, amount, type, category, date, quantity, rate } = req.body;
    const newEntry = new Expense({
      userEmail,
      title,
      amount,
      type,
      category,
      date: date || new Date(),
      quantity,
      rate
    });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add entry' });
  }
};

// Get all entries for a user
exports.getExpenses = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const entries = await Expense.find({ userEmail: email }).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

// Delete an entry
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};
