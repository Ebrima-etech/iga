'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-family)',
        padding: '20px',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Something went wrong!</h1>
      <p style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: 'var(--button-padding)',
          borderRadius: 'var(--button-radius)',
          backgroundColor: 'var(--color-primary-600)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        Try again
      </button>
    </div>
  );
}
