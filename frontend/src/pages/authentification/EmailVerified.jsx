import { useNavigate } from 'react-router-dom';
import Button from "../../components/common/Button";
import AuthLayout from '../../components/authentification/AuthPageLayout';
const EmailVerified = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
    <div className="flex flex-col flex-1">
      <div className="special-font flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mt-[20px] mx-auto mb-2 special-font hero-heading text-black text-title-sm dark:text-white/90 sm:text-title-md sm:text-4xl">
              <b>         Email vérifié avec succès!
              </b>
            </h1>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 sm:text-base">
              Votre adresse email a été confirmée. Vous pouvez maintenant vous connecter.
            </p>
          </div>
        </div>
      </div>
     
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3 }}
        onClick={() => navigate('/login')}
      >
        Se connecter
      </Button>
    </div>
    </AuthLayout>
  );
};

export default EmailVerified; 