import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TiLocationArrow } from 'react-icons/ti';
import Label from '../common/Label';
import Input from '../common/InputField';
import Button from '../common/Button';
import AuthLayout from './AuthPageLayout';
import "../../index.css";

const AuthForm = ({ type, onSubmit, serverError }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Define validation schema based on form type
  const getValidationSchema = () => {
    let schema = {
      email: Yup.string().email('Invalid email').required('Required'),
    };

    if (type !== 'forgotPassword') {
      schema.password = Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Required');
    }

    if (type === 'register') {
      schema.fname = Yup.string().required('First name is required');
      schema.lname = Yup.string().required('Last name is required');
    }

    if (type === 'resetPassword') {
      schema.confirmPassword = Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required');
    }

    return Yup.object().shape(schema);
  };

  const formik = useFormik({
    initialValues: {
      lname: '',
      fname: '',
      email: '',
      password: '',
      confirmPassword: '',
      token: '',
    },
    validationSchema: getValidationSchema(),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const getTitle = () => {
    switch (type) {
      case 'register': return 'Sign Up';
      case 'login': return 'Sign In';
      case 'forgotPassword': return 'Forgot Password';
      case 'resetPassword': return 'Reset Password';
      case 'verifyEmail': return 'Verify Email';
      case 'emailVerificationSent': return 'Email Verification Sent';
      default: return '';
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'register': return 'Sign Up';
      case 'login': return 'Sign In';
      case 'forgotPassword': return 'Send Reset Link';
      case 'resetPassword': return 'Reset Password';
      case 'verifyEmail': return 'Login';
      default: return 'Submit';
    }
  };

  return (
    <AuthLayout>

    <div className="relative flex w-full h-full lg:w-1/2  flex-1 flex-col items-center">
      <div className="special-font flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-2 sm:mb-4">
            <h1 className="mt-[15px] mx-auto mb-1 special-font hero-heading text-black text-title-sm dark:text-white/90 sm:text-title-md sm:text-4xl">
              <b>{getTitle()}</b>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {type === 'login' && 'Enter your email and password to sign in!'}
              {type === 'register' && 'Create your account to get started!'}
              {type === 'forgotPassword' && 'Enter your email to reset your password'}
              {type === 'resetPassword' && 'Enter your new password'}
              {type === 'verifyEmail' && 'Enter your verification token'}
                {type === 'emailVerificationSent' && 'Check your email for the verification link'}
            </p>
          </div>

          {type === 'login' && (
            <>
              <div className="grid grid-cols-1 gap-3">
                <button className="inline-flex items-center justify-center py-3 text-sm font-normal text-black transition-colors bg-[#64FF07] rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-[#64FF07] dark:text-white/90 dark:hover:bg-white/10">
                  <img src="/icons/google-icon.svg" alt="google" className="w-6 h-6 mr-2" />
                  Sign in with Google
                </button>
              </div>

              <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#64FF07] dark:border-[#64FF07]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="p-2 text-gray-400 bg-white dark:bg-black sm:px-5 sm:py-2">
                    Or
                  </span>
                </div>
              </div>
            </>
          )}
          

          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
              {type === 'register' && (
                <>
                <div className="grid grid-cols-1 gap-3">
                <button className="inline-flex items-center justify-center py-3 text-sm font-normal text-black transition-colors bg-[#64FF07] rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-[#64FF07] dark:text-white/90 dark:hover:bg-white/10">
                  <img src="/icons/google-icon.svg" alt="google" className="w-6 h-6 mr-2" />
                  Sign in with Google
                </button>
              </div>

              <div className="relative py-1 sm:py-1">
                <div className="absolute inset-0 flex items-center m-0 p-0">
                  <div className="w-full border-t border-[#64FF07] dark:border-[#64FF07]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="p-1 text-gray-500 bg-white dark:bg-black sm:px-0 sm:py-0">
                    Or
                  </span>
                </div>
              </div>
              <div  className='flex place-content-between m-0 p-0'>
                <div>
                  <Label htmlFor="fname" className="special-font hero-headin sm:text-2xl text-black dark:text-white ">
                    <b>first Name</b> <span className="text-error-500 text-red-600">*</span>
                  </Label>
                  <Input
                    placeholder="Your first name"
                    id="fname"
                    name="fname"
                    value={formik.values.fname}
                    onChange={formik.handleChange}
                    error={formik.touched.fname && formik.errors.fname}
                  />
                  {formik.touched.fname && formik.errors.fname && (
                    <div className="text-red-500 text-sm">{formik.errors.fname}</div>
                  )}
                </div>

                <div>
                  <Label htmlFor="lname" className="special-font hero-headin sm:text-2xl text-black dark:text-white">
                    <b>Last Name</b> <span className="text-error-500 text-red-600">*</span>
                  </Label>
                  <Input
                    placeholder="Your last name"
                    id="lname"
                    name="lname"
                    value={formik.values.lname}
                    onChange={formik.handleChange}
                    error={formik.touched.lname && formik.errors.lname}
                  />
                  {formik.touched.lname && formik.errors.lname && (
                    <div className="text-red-500 text-sm">{formik.errors.lname}</div>
                  )}
                </div>
              </div>
                </>
                
              )}

                {type !== 'emailVerificationSent' && (

              <div>
                <Label htmlFor="email" className="special-font hero-headin sm:text-2xl text-black dark:text-white">
                  <b>Email</b> <span className="text-error-500 text-red-600">*</span>
                </Label>
                <Input
                  placeholder="info@gmail.com"
                  id="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && formik.errors.email}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-sm">{formik.errors.email}</div>
                )}
              </div>
                )}


                {(type !== 'forgotPassword' && type !== 'emailVerificationSent') && (
                <>
                  <Label htmlFor="password" className="special-font hero-headin sm:text-2xl text-black dark:text-white">
                    <b>Password</b> <span className="text-error-500 text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      id="password"
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      error={formik.touched.password && formik.errors.password}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      <img
                        src={
                          showPassword
                            ? "/icons/EyeIcon.svg"
                            : "/icons/EyeCloseIcon.svg"
                        }
                        alt="Toggle Password Visibility"
                        className="w-5 h-5 fill-gray-500 dark:fill-gray-400"
                      />
                    </span>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-red-500 text-sm">{formik.errors.password}</div>
                  )}
                  
                </>
              )}

              {type === 'resetPassword' && (
                <>
                  <Label htmlFor="confirmPassword" className="special-font hero-headin sm:text-2xl text-black dark:text-white">
                    <b>Confirm Password</b> <span className="text-error-500 text-red-600">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <div className="text-red-500 text-sm">{formik.errors.confirmPassword}</div>
                  )}
                </>
              )}

              {type === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => setIsChecked(!isChecked)}
                      className="w-4 h-4 text-[#64FF07] border-gray-300 rounded focus:ring-[#64FF07]"
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <a
                    href="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 text-[#64FF07]"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              {serverError && (
                <div className="text-red-500 text-sm">
                  {serverError}
                </div>
              )}
                {type !== 'emailVerificationSent' && (
                  <div>
                    <Button
                      id="submit-form"
                      title={getButtonText()}
                      type="submit"
                      leftIcon={<TiLocationArrow />}
                      containerClass="flex-center gap-1"
                      className="text-white bg-black"
                    />
                  </div>
                )}
            </div>
          </form>

          {(type === 'login' || type === 'register') && (
            <div className="mt-1 flex justify-center">
              <p className="text-sm text-center text-black dark:text-gray-400 sm:text-start">
                {type === 'login' ? "Don't have an account?" : "Already have an account?"}{" "}
                <a
                    href={
                      type === 'login' ? "/register" : "/login"} 
                  className="hover:text-brand-600 dark:text-brand-400 text-[#64FF07]"
                >
                  {type === 'login' ? "Sign Up" : "Sign In"}


                </a>
              </p>
            </div>
          )}
            {type === 'emailVerificationSent' && (
              <Button
                title="Check your email"
                className="text-white bg-black mt-4"
                id="check-email"
                leftIcon={<TiLocationArrow />}
                onClick={() => window.open('https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox', '_blank')} />

            )}

        </div>
      </div>
    </div>
    </AuthLayout>
  );
};

export default AuthForm;