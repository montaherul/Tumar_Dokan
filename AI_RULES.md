# AI Assistant Rules for myproject

This document outlines the core technologies used in the `myproject` application and provides clear guidelines for library usage.

## Tech Stack Description

*   **React**: The primary JavaScript library for building the user interface, enabling component-based development and efficient UI updates.
*   **Vite**: A fast build tool that provides an extremely quick development experience for modern web projects.
*   **Tailwind CSS**: A utility-first CSS framework used for rapidly styling components directly in JSX, ensuring a consistent and responsive design.
*   **React Router DOM**: Handles client-side routing, allowing for declarative navigation and dynamic content loading within the single-page application.
*   **Firebase**: A comprehensive platform providing backend services, including:
    *   **Firebase Authentication**: Manages user sign-up, login (email/password, Google, GitHub), and session management.
    *   **Firebase Firestore**: A NoSQL cloud database used for storing application data like user orders.
*   **JavaScript/JSX**: The main programming language for the frontend logic and UI definition.
*   **Fakestore API**: An external API used to fetch product data for the e-commerce sections of the application.
*   **Lucide React**: A collection of beautiful and customizable open-source icons, integrated for visual elements.
*   **shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS, used for building accessible and customizable UI elements.

## Library Usage Rules

*   **Routing and Navigation**: Always use `react-router-dom` for all routing, navigation links (`Link`, `NavLink`), programmatic navigation (`useNavigate`), and data loading (`useLoaderData`).
*   **Styling**: All styling must be done using **Tailwind CSS** classes. Prioritize using existing `shadcn/ui` components where applicable, as they are already styled with Tailwind.
*   **Authentication**: Use **Firebase Authentication** for all user-related authentication flows (registration, login, logout, password reset, social logins).
*   **Database Operations**: For storing and retrieving application data (e.g., orders), use **Firebase Firestore**.
*   **Icons**: Integrate icons using the `lucide-react` library.
*   **UI Components**: Whenever possible, leverage components from the **shadcn/ui** library to maintain consistency and accessibility. If a specific component is not available or needs significant customization, create a new, small, focused component using Tailwind CSS.
*   **External Data Fetching**: For fetching data from external APIs (like the Fakestore API), use the native `fetch` API or `react-router-dom`'s `loader` function.
*   **State Management**: For local component state, use React's `useState` and `useEffect` hooks. For global authentication state, `AuthContext` is provided.