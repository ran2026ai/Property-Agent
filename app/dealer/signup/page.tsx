import DealerSignupForm from '@/components/DealerSignupForm';

export default function DealerSignupPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        <DealerSignupForm />
      </div>
    </div>
  );
}