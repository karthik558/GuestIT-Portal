# GuestIT Portal ✨

**A Modern, Feature-Rich Guest IT Portal Application built with React, TypeScript, and Supabase.**

![GuestIT-Portal](https://raw.githubusercontent.com/FoORK-Lab/wifi-auth-dependencies/main/wifi-home.gif)

---

GuestIT Portal provides a dedicated, user-friendly platform for guests in hospitality settings (like hotels and resorts) to submit IT-related complaints and suggestions directly to the establishment's IT department. Issues like Wi-Fi connectivity problems, smart TV malfunctions, or feedback on digital amenities can be logged easily. Built with a modern stack including React, TypeScript, Supabase, and Shadcn UI, the application offers a seamless, responsive, and efficient experience for both guests lodging the feedback and the IT staff managing it, facilitating quicker issue tracking and resolution.

## Key Features

*   **✨ Sleek, Responsive Interface:** Crafted with Shadcn UI and Tailwind CSS for a beautiful look on any device (desktop, tablet, mobile). Includes Light/Dark mode support.
*   **🔐 Secure User Authentication:** Integrated with Supabase Auth for reliable and secure user management.
*   **🔄 Real-time Data Synchronization:** Powered by Supabase's real-time capabilities, ensuring data is always up-to-date across sessions.
*   **📊 Insightful Data Dashboards:** Visualize key metrics and guest data with interactive charts and summaries.
*   **📄 On-Demand PDF Report Generation:** Easily generate and download PDF reports for bookings or guest summaries.
*   **👍 User-Friendly Toast Notifications:** Get immediate notifications when you receive a request (Need to enable browser notification permission).
*   **🎨 Theme Customization:** Easily adaptable theme to match branding requirements (built upon Shadcn UI's theming).

## Screenshots

| Feature | Dark Mode | Light Mode |
| :------ | :-------- | :--------- |
| **Request Assistance** | ![Dark Request](https://raw.githubusercontent.com/FoORK-Lab/wifi-auth-dependencies/main/request_assistance.png) | ![Light Request](https://raw.githubusercontent.com/FoORK-Lab/wifi-auth-dependencies/main/request_assistance_light.png) |
| **Login Page** | ![Dark Login](https://raw.githubusercontent.com/FoORK-Lab/wifi-auth-dependencies/main/login_page.png) | ![Light Login](https://raw.githubusercontent.com/FoORK-Lab/wifi-auth-dependencies/main/login_page_light.png) |
| **Dashboard** | ![Dark Dashboard](https://raw.githubusercontent.com/FoORK-Lab/wifi-auth-dependencies/main/dashboard.png) | ![Light Dashboard](https://raw.githubusercontent.com/FoORK-Lab/wifi-auth-dependencies/main/dashboard_light.png) |
| **Requests** | ![Dark Requests](https://raw.githubusercontent.com/FoORK-Lab/wifi-auth-dependencies/main/completed_requests.png) | ![Light Requests](https://raw.githubusercontent.com/FoORK-Lab/wifi-auth-dependencies/main/completed_requests_light.png) |


## Technology Stack

*   **Core Framework:** [React 18](https://reactjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
*   **Data Fetching/State:** [React Query (TanStack Query)](https://tanstack.com/query/latest)
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/)
*   **Schema Validation:** [Zod](https://zod.dev/)
*   **Build Tool & Dev Server:** [Vite](https://vitejs.dev/)
*   **Package Manager:** npm / yarn

## Getting Started

Follow these instructions to get a local copy up and running for development purposes.

### Prerequisites

*   **Node.js:** Version 18.x or higher. ([Download Node.js](https://nodejs.org/))
*   **npm** or **yarn:** Included with Node.js or install yarn ([Install Yarn](https://yarnpkg.com/getting-started/install)).
*   **Supabase Account:** You'll need a Supabase project for the backend. ([Sign up for Supabase](https://supabase.com/))
*   **Git:** Required to clone the repository. ([Install Git](https://git-scm.com/))

### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/karthik558/GuestIT-Portal.git
    cd GuestIT-Portal
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or if you prefer yarn
    # yarn install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env` file in the root directory of the project.
    *   Add your Supabase project URL and Anon Key:
        ```dotenv
        VITE_SUPABASE_URL=YOUR_SUPABASE_URL
        VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    *   You can find these in your Supabase project settings (API section).

4.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```

5.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:8080` (Vite's default port) or the port specified in your terminal output.

## Contributing

Contributions are welcome and greatly appreciated! If you have suggestions for improvements or want to add new features:

1.  **Fork the Repository:** Create your own copy of the project.
2.  **Create a Feature Branch:**
    ```bash
    git checkout -b feature/YourAmazingFeature
    ```
3.  **Make Your Changes:** Implement your feature or fix.
4.  **Commit Your Changes:**
    ```bash
    git commit -m 'feat: Add some AmazingFeature'
    ```
    *(Consider using [Conventional Commits](https://www.conventionalcommits.org/) for commit messages).*
5.  **Push to Your Branch:**
    ```bash
    git push origin feature/YourAmazingFeature
    ```
6.  **Open a Pull Request:** Submit your changes for review.

Please open an issue first to discuss significant changes or new features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for full details.

## Acknowledgments

*   [Shadcn UI](https://ui.shadcn.com/) - For the foundational UI components.
*   [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework.
*   [Supabase](https://supabase.com/) - For the excellent backend-as-a-service platform.
*   [Vite](https://vitejs.dev/) - For the blazing fast build tooling.
*   [21st.dev](https://21st.dev/) - For hero section component.
*   All contributors and users of the libraries mentioned in the Tech Stack.

## Author

*   **KARTHIK LAL**
    *   GitHub: [karthik558](https://github.com/karthik558)
    *   Email: `dev@karthiklal.in`
---