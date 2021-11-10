interface Params {
    email: string
}

function SuccessfulRegister({ email }: Params) {
    return (
        <div>
            Registered successfully. Please check { email } to a verification email
        </div>
    )
}

export default SuccessfulRegister
