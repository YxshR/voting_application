export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            VoteApp
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            A secure and transparent voting platform that empowers communities to make decisions together. 
            Create polls, cast votes, and see real-time results in a user-friendly interface.
          </p>
          
          <div className="space-y-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition duration-200">
              Email ID
            </button>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-3">Easy to Use</h3>
                <p className="text-gray-600">Simple interface for creating and participating in votes</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-3">Real-time Results</h3>
                <p className="text-gray-600">See voting results update instantly as votes are cast</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-3">Secure Voting</h3>
                <p className="text-gray-600">Ensure fair and transparent voting process</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
