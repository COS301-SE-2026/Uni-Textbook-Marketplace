
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#000f2b] mb-1">Welcome back</h1>
        <p className="text-sm text-[#4B4F58] mb-6">
          Sign in to your university account
        </p>

        <form className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="form-label">
              University email
            </label>
            <input
              id="email"
              type="email"
              placeholder="student@tuks.co.za"
              className="px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="px-4 py-3"
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            Sign In
          </button>
        </form>

        <p className="text-sm text-center text-[#4B4F58] mt-6">
          Don&apos;t have an account?{' '}
          <a href="/auth/register" className="text-[#006D8A] font-medium">
            Register here
          </a>
        </p>
      </div>
    </div>
  )
}