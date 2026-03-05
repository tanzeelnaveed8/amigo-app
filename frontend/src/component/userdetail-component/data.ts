import { object, string } from "yup";

export const DATA = [
    {
        id: '1',
        name: 'firstname',
        title: 'First Name',
        placeholder: 'First Name'
    },
    {
        id: '2',
        name: 'lastname',
        title: 'Last Name',
        placeholder: 'Last Name'
    },
    {
        id: '3',
        name: 'bio',
        title: 'Bio',
        placeholder: 'Bio'
    },
    {
        id: '4',
        name: 'username',
        title: 'Username',
        placeholder: 'Username'
    },
    {
        id: '5',
        name: 'email',
        title: 'Email',
        placeholder: 'Email'
    },
    {
        id: '6',
        name: 'password',
        title: 'Password',
        placeholder: 'Password'
    },
]

export const profileSchema = object().shape({
    firstname: string().required('Please enter your firstname').min(2),
    lastname: string().required('Please enter your lastname').min(2),
    bio: string().required('Please enter your bio').min(2),
    username: string().required('Please enter your username').min(3, 'Username must contain at least 3 alphabets'),
    email: string()
        .required('Please enter your email')
        .email('Please enter a valid email address'),
    password: string().required('Please enter your password').min(5),
});

export interface userdetailProps {
    onPress: (val: string) => void
    onImage: (val: any) => void
}