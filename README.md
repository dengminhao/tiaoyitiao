# Jump Jump 3D

A 3D casual game where players control a character to jump between improved procedurally generated platforms. Built with **React**, **Three.js** (@react-three/fiber), and **Tailwind CSS**.

## 🎮 Game Features

- **Endless Gameplay**: Platforms generate infinitely as you progress.
- **Physics-based Jumping**: Hold to charge your jump. Longer hold = further jump.
- **Dynamic Camera**: Smooth Isometric camera follows the player without inducing motion sickness.
- **Responsive Design**: Works on Desktop (Mouse) and Mobile (Touch).
- **Visuals**: Soft shadows, environment lighting, and squash-and-stretch animations.

## 🛠 Tech Stack

- [React 19](https://react.dev/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [React Three Drei](https://github.com/pmndrs/drei)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🚀 Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start development server:**
    ```bash
    npm run dev
    ```
    Open http://localhost:5173 to view it in the browser.

## 📦 Build

To create a production-ready build:

```bash
npm run build
```

The output files will be in the `dist` directory.

## ☁️ Deploy to Cloudflare Pages

This project is optimized for [Cloudflare Pages](https://pages.cloudflare.com/).

### Method 1: Git Integration (Recommended)

1.  Push this code to a GitHub/GitLab repository.
2.  Log in to the Cloudflare Dashboard and go to **Pages**.
3.  Click **Create a project** > **Connect to Git**.
4.  Select your repository.
5.  **Build Settings**:
    *   **Framework preset**: `Vite`
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`
6.  Click **Save and Deploy**.

### Method 2: Direct Upload

1.  Run `npm run build` locally.
2.  Go to Cloudflare Pages.
3.  Select **Create a project** > **Direct Upload**.
4.  Upload the contents of the `dist` folder.

## 🕹 Controls

*   **Desktop**: Click and hold Left Mouse Button to charge. Release to jump.
*   **Mobile**: Touch and hold screen to charge. Release to jump.
