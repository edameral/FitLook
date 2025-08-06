#  FitLook

**FitLook** is a full-stack AI-powered fashion assistant platform that helps users discover personalized outfit suggestions, analyze their fashion style, try on clothes virtually, and track style trends using cutting-edge technologies.

📌[▶ Watch Demo Video](https://youtube.com/shorts/EXZVHKMMLDE?si=tGrBrgDE_OBIkdfH)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [How It Works](#how-it-works)
- [License](#license)

---

## Overview

**FitLook** is designed for fashion lovers and shoppers who want to simplify the process of choosing the right outfit for the right occasion. With integrated AI capabilities such as outfit analysis, image generation, and virtual try-on, FitLook delivers a highly personalized and immersive fashion experience.

It consists of three major modules:

-  **Backend API** – Built with Java Spring Boot for managing user data, outfit suggestions, and storing images.
-  **AI Module** – Built with Python and LangChain using Gemini Pro Vision for deep outfit analysis and image-based recommendations.
-  **Frontend App** – Built with React Native for a smooth mobile experience.

---

##  Tech Stack

###  Backend
- Java 17
- Spring Boot
- REST APIs

###  AI Module
- Python 3.11+
- LangChain
- Gemini 2.5 Pro
- Kling AI Image API
- Kling AI Try-On API


###  Frontend
- React Native
- Expo
- Firebase Authentication (optional)
- Axios

---

## Architecture

```text
[Frontend (React Native)]
        ⬇️
[Backend (Spring Boot REST API)]
        ⬇️
[AI Module (LangChain + Gemini)]
```



---

## Installation

```bash
git clone https://github.com/edameral/FitLook.git
cd FitLook
```

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### AI Module
```bash
cd ai_modul
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd fitlook-app
npm install
npx expo start
```

---

## ⚙️ Configuration

Create the following environment files before running:

### `.env` (inside `ai_modul`)
```env
GOOGLE_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=models/

```



---

## How It Works

1. **User uploads an outfit photo in the mobile app**
2. **Frontend sends the image to the Python AI module**
3. **LangChain+Gemini analyzes the outfit and generates suggestions**
4. **Backend stores and serves suggestion data**
5. **Frontend shows the results and allows further actions (shopping links, virtual try-on, etc.)**

---

---


## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙋‍♀️ Author

Made with by [@edameral](https://github.com/edameral) & [@aligöktuğkaplan](https://github.com/goktugkaplan)
