import { create } from "zustand";
import { User } from "firebase/auth";
import { auth } from "@/hooks/FirebaseAuth/firebaseConfig";

type State = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: {
        publicId: string;
        url: string;
    };
    loggedIn: boolean;
    isFirebaseLoggedIn: boolean;
};

type Action = {
    updatePerson: (
        _id: State["_id"],
        firstName: State["firstName"],
        lastName: State["lastName"],
        email: State["email"],
        avatar: State["avatar"]
    ) => void;
    setLoggedIn: (loggedIn: boolean) => void;
    setFirebaseLoggedIn: (isFirebaseLoggedIn: boolean) => void;
    setUserFromFirebase: (user: User | null) => void;
};

const usePersonStore = create<State & Action>((set) => ({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    avatar: { publicId: "", url: "" },
    loggedIn: localStorage.getItem('loggedIn') === 'true',
    isFirebaseLoggedIn: localStorage.getItem('isFirebaseLoggedIn') === 'true',

    updatePerson: (_id, firstName, lastName, email, avatar) => {
        const loggedIn = Boolean(_id);
        localStorage.setItem('loggedIn', loggedIn.toString());
        set({ _id, firstName, lastName, email, avatar, loggedIn });
    },

    setLoggedIn: (loggedIn) => {
        localStorage.setItem('loggedIn', loggedIn.toString());
        set({ loggedIn });
    },

    setFirebaseLoggedIn: (isFirebaseLoggedIn) => {
        localStorage.setItem('isFirebaseLoggedIn', isFirebaseLoggedIn.toString());
        set({ isFirebaseLoggedIn });
    },

    setUserFromFirebase: (user) => {
        if (user) {
            const { uid, displayName, email, photoURL } = user;
            const [firstName, lastName] = displayName?.split(' ') ?? ["", ""];
            const avatar = { publicId: "", url: photoURL || "" };

            set({
                _id: uid,
                firstName,
                lastName,
                email: email || "",
                avatar,
                isFirebaseLoggedIn: true,
            });
            localStorage.setItem('isFirebaseLoggedIn', 'true');
        }
    },
}));

auth.onAuthStateChanged((user) => {
    usePersonStore.getState().setUserFromFirebase(user);
});

export default usePersonStore;
