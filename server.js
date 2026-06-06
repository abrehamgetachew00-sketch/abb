const express = require('express');
const cors = require('cors');
const app = express();

// Use the dynamic port provided by the hosting service, or fallback to 3000 locally
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simulated Data Vault (Persists while server runs)
let users = {
    "buyer_01": { id: "buyer_01", username: "Alex", role: "buyer", balance: 500.00 },
    "seller_01": { id: "seller_01", username: "Yeshi", role: "seller", balance: 0.00 }
};

let platformMetrics = {
    totalEscrowRevenue: 0.00,
    collectedCommissions: 0.00
};

let listings = [
    { id: "list_01", sellerId: "seller_01", title: "Cinematic 3D Brand Logo Layout", price: 25.00 },
    { id: "list_02", sellerId: "seller_01", title: "Real-time Dashboard & Counter Widget", price: 45.00 },
    { id: "list_03", sellerId: "seller_01", title: "Modern Dark Banner & UI Kit Bundle", price: 20.00 }
];

let orders = [];

// API: Fetch All Assets
app.get('/api/listings', (req, res) => {
    res.json(listings);
});

// API: Fetch Specific Profile Info
app.get('/api/user/:id', (req, res) => {
    const user = users[req.params.id];
    if (user) res.json(user);
    else res.status(404).json({ error: "Profile execution fallback: user not found." });
});

// API: Fetch Admin Analytics
app.get('/api/admin/stats', (req, res) => {
    res.json(platformMetrics);
});

// API: Core Transaction Escrow Processor
app.post('/api/purchase', (req, res) => {
    const { buyerId, listingId } = req.body;
    
    const buyer = users[buyerId];
    const listing = listings.find(l => l.id === listingId);
    
    if (!buyer || !listing) {
        return res.status(400).json({ error: "Invalid tracking references supplied." });
    }
    
    if (buyer.balance < listing.price) {
        return res.status(400).json({ error: "Insufficient purchasing credit line." });
    }
    
    const seller = users[listing.sellerId];
    
    // Financial Split Automation Routine
    buyer.balance -= listing.price; 
    
    const commissionCut = listing.price * 0.20; // 20% Platform Revenue Fee
    const sellerPayout = listing.price - commissionCut; // 80% Net to Worker
    
    seller.balance += sellerPayout; 
    platformMetrics.collectedCommissions += commissionCut; 
    
    const trackingOrder = {
        id: "ord_" + Math.random().toString(36).substr(2, 9),
        listingId: listing.id,
        buyerId: buyer.id,
        sellerId: seller.id,
        grossAmount: listing.price,
        platformFee: commissionCut,
        netPayout: sellerPayout,
        status: "completed"
    };
    
    orders.push(trackingOrder);
    
    res.json({
        success: true,
        receipt: trackingOrder
    });
});

app.listen(PORT, () => {
    console.log(`Marketplace Core live and processing requests on port ${PORT}`);
});
