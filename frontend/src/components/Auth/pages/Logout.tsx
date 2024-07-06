import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/hooks/FirebaseAuth/firebaseConfig";
import { logout } from "@/lib/api";
import usePersonStore from "@/lib/Utils/zustandStore";

interface RegularLogoutProps {
    buttonLabel: string;
}

interface FirebaseLogoutProps {
    buttonLabel: string;
}

const Logout: React.FC = () => {
    const isFirebaseLoggedIn = usePersonStore(
        (state) => state.isFirebaseLoggedIn,
    );

    return (
        <div>
            {isFirebaseLoggedIn ? (
                <GauthLogout buttonLabel="Logout" />
            ) : (
                <RegularLogout buttonLabel="Logout" />
            )}
        </div>
    );
};

export default Logout;

const GauthLogout: React.FC<FirebaseLogoutProps> = ({ buttonLabel }) => {
    const navigate = useNavigate();
    const updatePerson = usePersonStore((state) => state.updatePerson);
    const setFirebaseLoggedIn = usePersonStore(
        (state) => state.setFirebaseLoggedIn,
    );

    const handleFirebaseLogout = async () => {
        const confirmed = window.confirm("Are you sure you want to logout?");
        if (confirmed) {
            try {
                await auth.signOut();
                setFirebaseLoggedIn(false); // Update isFirebaseLoggedIn state
                updatePerson("", "", "", "", { publicId: "", url: "" });
                navigate("/");
            } catch (error) {
                console.error(error); // Handle error
            }
        }
    };

    return (
        <button type="button" onClick={handleFirebaseLogout}>
            {buttonLabel}
        </button>
    );
};

const RegularLogout: React.FC<RegularLogoutProps> = ({ buttonLabel }) => {
    const navigate = useNavigate();
    const updatePerson = usePersonStore((state) => state.updatePerson);
    const setLoggedIn = usePersonStore((state) => state.setLoggedIn);

    const handleRegularLogout = async () => {
        const confirmed = window.confirm("Are you sure you want to logout?");
        if (confirmed) {
            try {
                await logout();
                updatePerson("", "", "", "", { publicId: "", url: "" });
                setLoggedIn(false); // Update loggedIn state only if backend logout is successful
                navigate("/");
            } catch (error) {
                console.error(error); // Handle error
            }
        }
    };

    return (
        <button type="button" onClick={handleRegularLogout}>
            {buttonLabel}
        </button>
    );
};
