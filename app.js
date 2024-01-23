const express = require('express');
const path = require('path');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Connect to PostgreSQL
const sequelize = new Sequelize('crypto_data', 'postgres', 'hitanshu', {
  host: 'localhost',
  dialect: 'postgres',
});

// Define the CryptoPrice model
const CryptoPrice = sequelize.define('CryptoPrice', {
  name: DataTypes.STRING,
  last: DataTypes.STRING,
  buy: DataTypes.STRING,
  sell: DataTypes.STRING,
  volume: DataTypes.STRING,
  base_unit: DataTypes.STRING,
});

// Sync the model with the database
sequelize.sync();

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

// Fetch data from the WazirX API, store it in the database, and then show it on the frontend
app.post('/fetch-store-and-show', async (req, res) => {
  try {
    // Fetch data from the WazirX API
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const top10 = Object.values(response.data).slice(0, 10);

    // Store data in the database
    await CryptoPrice.bulkCreate(top10, { ignoreDuplicates: true });

    // Retrieve stored data from the database
    const storedData = await CryptoPrice.findAll();

    // Send the stored data to the frontend
    res.json({ success: true, message: 'Data fetched, stored, and sent successfully.', data: storedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching, storing, or sending data.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
