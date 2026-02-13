const http = require('http');

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Full-Queso-Test/1.0',
        'Origin': 'http://localhost:5173'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testOrderCreation() {
  try {
    console.log('🧪 Probando creación de orden...');
    
    const orderData = {
      customerInfo: {
        email: 'test@example.com',
        phone: '04141234567',
        name: 'Juan Pérez'
      },
      items: [
        {
          id: 1,
          name: 'Pizza Margherita',
          price: 12.50,
          quantity: 1
        }
      ],
      total: 12.50,
      deliveryAddress: 'Av. Principal, Caracas, Venezuela',
      deliveryNotes: 'Servicio: delivery, Tienda: centro'
    };
    
    console.log('📤 Enviando datos:', JSON.stringify(orderData, null, 2));
    
    const response = await makeRequest(orderData);
    
    if (response.status === 201) {
      console.log('✅ Orden creada exitosamente:');
      console.log('📋 ID de orden:', response.data.order.id);
      console.log('👤 ID de cliente:', response.data.order.customerId);
      console.log('💰 Total:', response.data.order.total);
      console.log('📅 Fecha:', response.data.order.createdAt);
    } else {
      console.log('❌ Error creando orden:');
      console.log('📋 Status:', response.status);
      console.log('📋 Error:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testOrderCreation();