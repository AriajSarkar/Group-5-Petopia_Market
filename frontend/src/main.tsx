import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import Login from "./components/Auth/pages/Login";
import Register from "./components/Auth/pages/Register";
import Profile from "./components/Auth/userProfile/Profile.tsx";
import Home from "./components/Ui/Home.tsx";
import NotFound from "./components/NotFound.tsx";
import Products from "./components/Ui/Pages/ProductPage/Products.tsx";
import Pets from "./components/Ui/Pets/Pets.tsx";
import PetDetails from "./components/Ui/Pets/PetDetails.tsx";
import Blogs from "./pages/Blogs/Blogs.tsx";
import Blog from "./pages/Blogs/BlogDetails.tsx";
import NewBlog from "./pages/Blogs/AddBlog.tsx";
import EditBlog from "./pages/Blogs/EditBlog.tsx";

function deleteCookie(name: string) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

function RegisterAndLogout() {
    deleteCookie('refreshToken');
    deleteCookie('authToken');
    return <Register />;
}

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element with id 'root' not found.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/register"
                            element={<RegisterAndLogout />}
                        />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/blogs" element={<Blogs />} />
                        <Route path="/blogs/:id" element={<Blog />} />
                        <Route path="/blogs/add" element={<NewBlog />} />
                        <Route path="/blogs/edit/:id" element={<EditBlog />} />
                        <Route path="/pets" element={<Pets />} />
                        <Route
                            path="/pets/getDetails/:id"
                            element={<PetDetails />}
                        />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>,
);
