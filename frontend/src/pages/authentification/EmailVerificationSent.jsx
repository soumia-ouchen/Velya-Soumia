import AuthForm from '../../components/authentification/AuthForm';

const EmailVerificationSent = () => {
    const handleSubmit = async () => {
        console.log("Email verification sent, user will be redirected to Gmail.");
    };

    return (
        <div>
            <AuthForm
                type="emailVerificationSent"
                onSubmit={handleSubmit}
            />

     
        </div>
    );
};

export default EmailVerificationSent;
