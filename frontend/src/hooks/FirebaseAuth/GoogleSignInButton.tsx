import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, auth, signInWithPopup } from './firebaseConfig';

interface GoogleSignInButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    buttonLabel: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
    onSuccess,
    onError,
    buttonLabel,
}) => {
    const navigate = useNavigate();
    const googleProvider = new GoogleAuthProvider();

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            if (user) {
                navigate('/');

                if (onSuccess) onSuccess();
            }
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);
            if (onError) onError(error as Error);
        }
    };


    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full mt-2 text-white bg-yellow-400 bg-left duration-500 ease-in-out hover:bg-right hover:text-black hover:bg-transparent hover:duration-500 hover:ease-in-out dark:text-gray-200 dark:bg-cyan-900 dark:hover:text-white dark:hover:bg-transparent focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center relative overflow-hidden transform-gpu"
        >
            <img
                width={25}
                height={25}
                src="https://svgshare.com/i/17uF.svg"
                className='mr-2'
                alt="Google Logo"
            />
            {buttonLabel}
        </button>
    );
};

export default GoogleSignInButton;
