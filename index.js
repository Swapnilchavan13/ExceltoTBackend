const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

const DataSchema = new mongoose.Schema({
  name: String,
  data: [{}],
}, { strict: false });
const DataModel = mongoose.model('Data', DataSchema);

app.post('/saveData', async (req, res) => {
  const { name, data } = req.body;
  if (!name || !data) {
    return res.status(400).send('Name and data are required');
  }

  try {
    let existingData = await DataModel.findOne({ name });
    if (existingData) {
      existingData.data = data;
      await existingData.save();
    } else {
      const newData = new DataModel({ name, data });
      await newData.save();
    }
    res.status(200).send('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Error saving data: ' + error.message);
  }
});

app.get('/getData/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const data = await DataModel.findOne({ name });
    if (data) {
      res.status(200).json(data.data);
    } else {
      res.status(404).send('Data not found');
    }
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Error retrieving data: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
