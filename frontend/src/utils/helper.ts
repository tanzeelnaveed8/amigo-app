export const _isEmpty = (val: any) => {
    if (
        !val ||
        val === '' ||
        val === 'No Image1' ||
        val === undefined ||
        val === null ||
        val.length <= 0 || //for array[]
        Object.keys(val).length <= 0 //for object{}
    ) {
        return true;
    } else {
        return false;
    }
};

export const searchData = (
    data: any[],
    searchText: string,
    searchValue?: string,
) => {
    const filteredArr = data?.filter(item =>
        item?.[searchValue ?? 'name']
            ?.toUpperCase()
            ?.includes(searchText?.toUpperCase()?.trim()?.replace(/\s/g, ' ')),
    );

    return filteredArr;
};

export const removeCopyItem = (data: any[], element?: string) => {
    let filteredArr: any[];
    if (!Array.isArray(data) || !data) {
        console.warn('Use Array instead of object or something');
        return [];
    }
    if (typeof data[0] === 'object') {
        if (!element || typeof element !== 'string') {
            console.warn('Use second perameter as string');
            return [];
        }
        filteredArr = data.filter(
            (item, index) =>
                data.map(res => res[element]).indexOf(item[element]) === index,
        );
    } else {
        filteredArr = data.filter((item, index) => data.indexOf(item) === index);
    }
    return filteredArr;
};

export const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-verification-code':
        return 'Invalid OTP code. Please check the numbers and try again.';

      case 'auth/code-expired':
        return 'OTP code has expired. Please request a new code.';

      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a few minutes before trying again.';

      case 'auth/session-expired':
        return 'Verification session expired. Please restart the verification process.';

      case 'auth/invalid-phone-number':
        return 'Invalid phone number. Please contact support.';

      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';

      case 'auth/app-not-authorized':
        return 'App not authorized for phone verification. Please contact support.';

      case 'auth/captcha-check-failed':
        return 'Security verification failed. Please try again.';

      case 'auth/invalid-app-credential':
        return 'App credentials are invalid. Please contact support.';

      case 'auth/missing-phone-number':
        return 'Phone number is missing. Please restart the verification process.';

      case 'auth/quota-exceeded':
        return 'Verification quota exceeded. Please try again later.';

      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';

      case 'auth/operation-not-allowed':
        return 'Phone verification is not enabled. Please contact support.';

      case 'auth/credential-already-in-use':
        return 'This phone number is already in use. Please use a different number.';

      case 'auth/invalid-credential':
        return 'Invalid credentials. Please restart the verification process.';

      case 'auth/user-not-found':
        return 'User not found. Please restart the verification process.';

      case 'auth/wrong-password':
        return 'Incorrect verification code. Please try again.';

      case 'auth/email-already-in-use':
        return 'This email is already in use. Please use a different email.';

      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';

      case 'auth/requires-recent-login':
        return 'Please log in again to continue.';

      case 'auth/timeout':
        return 'Request timed out. Please check your connection and try again.';

      default:
        return 'Verification failed. Please try again or contact support if the problem persists.';
    }
  };

/**
 * Convert crowd name slug (with hyphens) to display name (with spaces)
 * This is used to show the original user-entered name with spaces
 * while keeping the slug version for URLs/QR codes
 */
export const getCrowdDisplayName = (crowdName: string | undefined | null): string => {
  if (!crowdName) return 'Crowd';
  // Convert hyphens to spaces for display
  return crowdName.replace(/-/g, ' ');
};
