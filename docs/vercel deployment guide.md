# 🚀 Step-by-Step Guide: Deploying to Vercel via GitHub

This guide walks you through the process of deploying your React/Vite application to Vercel for free using their seamless GitHub integration.

## Step 1: Push Your Code to GitHub

Before Vercel can host your app, it needs to read your code from a GitHub repository.

1. Go to [GitHub](https://github.com/) and create a new repository (it can be public or private).
2. Open your terminal in your project directory (`c:\Users\abhis\OneDrive\Documents\grabble-ai`) and run the following commands to push your code:

```bash
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

_(Make sure to replace the URL with your actual repository URL)._

---

## Step 2: Create a Vercel Account

1. Go to [Vercel.com](https://signup.vercel.app/).
2. Click **"Continue with GitHub"** to create your account. This automatically links Vercel to your GitHub profile, allowing it to see your repositories.

---

## Step 3: Import Your Repository

1. Once logged into Vercel, you will be taken to your dashboard.
2. Click the **"Add New..."** button in the top right corner and select **"Project"**.
3. You will see a list of your GitHub repositories. Find the repository you just created in Step 1 and click the **"Import"** button next to it.

---

## Step 4: Configure Build Settings

Vercel is very smart and will automatically detect that you are using Vite and React. However, verify the following settings on the configuration page:

- **Project Name:** Choose a name for your app (this will be part of your free `.vercel.app` URL).
- **Framework Preset:** Ensure this is set to **Vite**.
- **Build Command:** `npm run build` (or leave default if Vercel detected Vite).
- **Output Directory:** `dist` (or leave default).
- **Install Command:** `npm install` (or leave default).

---

## Step 5: Add Crucial Environment Variables (CRITICAL)

Your app uses the Gemini AI API, which relies on a secret key. Since you cannot upload your `.env` file to GitHub for security reasons, you must give Vercel the key manually.

1. On the same configure page, click on the **"Environment Variables"** section to expand it.
2. Under "Name", type exactly: `VITE_GEMINI_API_KEY`
3. Under "Value", paste your actual Google AI Studio Gemini API key.
4. Click **"Add"**.

_(Note: If your app uses any other keys in your `.env` file, add them here exactly as they appear locally)._

---

## Step 6: Deploy 🚀

1. Click the big **"Deploy"** button.
2. Vercel will now clone your repository from GitHub, install your dependencies, run the build process, and publish the app.
3. Wait about 30-60 seconds for the process to finish.
4. Once completed, Vercel will give you a confetti celebration and provide you with a live URL (e.g., `https://your-app-name.vercel.app`).

---

## Automatic Updates (CI/CD)

The best part about this setup is that it is fully automated. In the future, whenever you make changes to your code locally, simply run:

```bash
git add .
git commit -m "Updated some features"
git push origin main
```

Vercel will detect the push to GitHub and automatically deploy the new version of your website within seconds!
