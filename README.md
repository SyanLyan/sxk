# Sai X Kuu - A Retrofuturistic Love Journal

Welcome to your private digital love journal. This project is a Next.js application designed with a Retrofuturism/Cyberpunk-lite aesthetic.

## 🚀 Getting Started

1.  Navigate to the project directory:
    ```bash
    cd sai-x-kuu
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

-   **`app/page.tsx`**: The Home page with the "Days of Us" counter and rotating quotes.
-   **`app/timeline/page.tsx`**: A vertical timeline of your relationship events.
-   **`app/gallery/page.tsx`**: A password-protected gallery (Default password is "love").
-   **`app/moments/page.tsx`**: Cards for special milestones like birthdays and anniversaries.
-   **`components/Navigation.tsx`**: The floating navigation menu.
-   **`app/globals.css`**: Contains the Retro-futurism styles (Grid, Scanlines, Glow).

## 🛠 Customizing

-   **Start Date**: Update the date in `app/page.tsx`.
-   **Images**: Place your photos in the `public/` folder and update `src` paths in `timeline` and `gallery` pages.
-   **Password**: Change the password logic in `app/gallery/page.tsx`.

## 🎨 Theme

The theme uses **Tailwind CSS v4** with custom CSS variables for the retro grid and scanlines. You can adjust colors in `app/globals.css`.

Enjoy building your memory gallery!
