import { object, string } from "yup";
import regexPatterns from "../../constants/regex";

export interface registerProps {
    onSendOTP: (value: string) => void
    error?: boolean
    message?: string
}

export const registerSchema = object().shape({
    code: string(),
    phone: string().required('Please enter your phone-number').min(10),
    // phone: string()
    //     .required('Please enter your phone-number')
    //     .test('phone-validation', 'Please enter a valid phone number', function(value) {
    //         if (!value) return false;
    //         // Remove any non-digit characters except + at the beginning
    //         const cleanPhone = value.replace(/[^\d+]/g, '');
    //         // Check if it starts with + and has at least 10 digits after country code
    //         if (cleanPhone.startsWith('+')) {
    //             const digitsOnly = cleanPhone.substring(1);
    //             return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    //         }
    //         // If no country code, check if it's at least 10 digits
    //         return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    //     }),
    // email: string()
    //     .matches(regexPatterns.email, 'Invalid email')
    //     .required('Enter your email'),
});
