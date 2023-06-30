# Whats-GPT-Firebase

<img src="images/fig1.jpg" />

Whatsapp-GPT-Firebase-txt2speach is a Node.js application that integrates WhatsApp-Web.js, GPT-3.5 language model with Cloudlabs Api, and Firebase Realtime DB. allowing you to make a WhatsApp chatbot powered by OpenAI's GPT-3.5 to respond, and convert the answer to speach using Cloudlabs API, and store the chat history in Firebase DB.

if you understand arabic you can watch the video on my channel => [Salah Bakhash](https://www.youtube.com/channel/UCFwqBlQH93pPRSeXTVTOMZw).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository to your local machine:

```
 git clone https://github.com/salahbakhash/Whatsapp-GPT-Firebase-Txt-To-Speech.git
```

2. Navigate to the project directory:

```
 cd Whatsapp-GPT-Firebase-Txt-To-Speech
```

3. Install the dependencies:

```
 npm install
```

- Set up Firebase:

4. Create a new Firebase project in the [Firebase Console](https://firebase.google.com/docs/web/setup).
   Replace the Firebase configuration values in the .env file with your project's configuration values. Refer to the Firebase documentation for more information on obtaining your project's configuration.
   Make sure your Firebase project has the Realtime Database enabled.

- Set up OpenAI:

5. Obtain an API key from [OpenAI](https://platform.openai.com/account/api-keys).
   Replace the placeholder OPEN_AI_KEY in the code with your actual OpenAI API key.

# Usage

To run the application, use the following command:

```
node index.js
```

- Once the application is running, you can access it through a web browser or use the provided endpoints http://localhost:3500.

- To authenticate with WhatsApp, open your browser and navigate to http://localhost:3500/authenticate/{phoneNumber}/{prompt}

- Replace {phoneNumber} with your WhatsApp phone number (including the country code) and {prompt} with the initial message you want to send to the chatbot.
- A QR code will be generated, which you need to scan using the WhatsApp app on your phone. Once scanned, you will be authenticated with WhatsApp and ready to start interacting with the chatbot.
- You can also use the /submit endpoint with a POST request to authenticate. Pass the phone number and prompt in the request body.
  The chat history will be stored in Firebase Realtime Database under the /links/test/{chatId} path.

# Contributing

this is not the main project, so if you want to contributing you should contributing your changes to the [Main Project](https://github.com/enghamzasalem/whats-gpt-firebase) By [@enghamzasalem](https://github.com/enghamzasalem/)

# License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).

License Attribution:
Developer Relations: [Hamza Salem](https://enghamzasalem.com/)
