import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#000f2b] mb-1">Create your account</h1>
        <p className="text-sm text-[#4B4F58] mb-6">
          Must be a university student to register
        </p>

        <form className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">First name</label>
              <input
                type="text"
                placeholder="Tiego"
                className="px-4 py-3"
              />
            </div>
            <div>
              <label className="form-label">Last name</label>
              <input
                type="text"
                placeholder="Mokwena"
                className="px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="form-label">University email</label>
            <input
              type="email"
              placeholder="student@tuks.co.za"
              className="px-4 py-3"
            />
            <p className="form-error hidden">
              Only @tuks.co.za and @up.ac.za emails are allowed
            </p>
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              className="px-4 py-3"
            />
          </div>

          <div>
            <label className="form-label">Confirm password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="px-4 py-3"
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            Create Account
          </button>
        </form>

        <p className="text-sm text-center text-[#4B4F58] mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#006D8A] font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}