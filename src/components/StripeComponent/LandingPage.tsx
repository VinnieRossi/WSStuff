const LandingPage = (): JSX.Element => {
  const onTestButtonClick = () => {
    console.log('clicked');
  };

  return (
    <div className='h-screen font-mono text-center bg-gray-800'>
      <div className='flex flex-col items-center justify-center h-screen text-2xl'>
        <h1 className='mb-4 text-5xl text-indigo-500'>Landing Page</h1>
        <button data-testid='testButton' onClick={onTestButtonClick} />
      </div>
    </div>
  );
};

export default LandingPage;
