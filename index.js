const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

// Yetkilendirme istemcisini oluştur
const auth = new GoogleAuth({
  keyFile: 'service-account.json', // Bu dosyanın adının doğru olduğundan emin olun
  scopes: 'https://www.googleapis.com/auth/wallet_object.issuer',
});

// Google Wallet API istemcisini oluştur
const wallet = google.walletobjects({
  version: 'v1',
  auth,
});

// Sınıf oluşturma fonksiyonu
async function createGenericClass(issuerId, classSuffix) {
  const classId = `${issuerId}.${classSuffix}`;

  // Sınıf olup olmadığını kontrol et
  try {
    const response = await wallet.genericclass.get({ resourceId: classId });
    console.log(`Class ${classId} already exists!`);
    return classId;
  } catch (err) {
    if (err.response && err.response.status !== 404) {
      console.error('Error checking class existence:', err);
      return null;
    }
  }

  // Yeni sınıf oluştur
  const newClass = {
    id: classId,
    issuerName: 'Example Issuer',
    reviewStatus: 'UNDER_REVIEW',
  };

  try {
    const response = await wallet.genericclass.insert({ requestBody: newClass });
    console.log('Class insert response:', response.data);
    return classId;
  } catch (err) {
    console.error('Error creating class:', err);
    return null;
  }
}

// Nesne oluşturma fonksiyonu
async function createGenericObject(issuerId, classSuffix, objectSuffix) {
  const objectId = `${issuerId}.${objectSuffix}`;

  // Nesne olup olmadığını kontrol et
  try {
    const response = await wallet.genericobject.get({ resourceId: objectId });
    console.log(`Object ${objectId} already exists!`);
    return objectId;
  } catch (err) {
    if (err.response && err.response.status !== 404) {
      console.error('Error checking object existence:', err);
      return null;
    }
  }

  // Yeni nesne oluştur
  const newObject = {
    id: objectId,
    classId: `${issuerId}.${classSuffix}`,
    state: 'ACTIVE',
    heroImage: {
      sourceUri: {
        uri: 'https://example.com/hero-image.png',
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: 'Hero image description',
        },
      },
    },
    barcode: {
      type: 'QR_CODE',
      value: 'QR1234567890',
    },
    textModulesData: [
      {
        header: 'Example Header',
        body: 'Example Body',
        id: 'TEXT_MODULE_ID',
      },
    ],
    cardTitle: {
      defaultValue: {
        language: 'en-US',
        value: 'Event Ticket',
      },
    },
  };

  try {
    const response = await wallet.genericobject.insert({ requestBody: newObject });
    console.log('Object insert response:', response.data);
    return objectId;
  } catch (err) {
    console.error('Error creating object:', err);
    return null;
  }
}

// Örnek kullanımı
async function main() {
  const issuerId = '3388000000022732026'; // Issuer ID
  const classSuffix = 'eventTicketClass1'; // Sınıf kimliği eklemesi
  const objectSuffix = 'eventTicketObject1'; // Nesne kimliği eklemesi

  const classId = await createGenericClass(issuerId, classSuffix);
  if (!classId) {
    console.error('Class creation failed.');
    return;
  }

  const objectId = await createGenericObject(issuerId, classSuffix, objectSuffix);
  if (!objectId) {
    console.error('Object creation failed.');
  }
}

main().catch(err => {
  console.error('Unexpected error occurred:', err);
});
