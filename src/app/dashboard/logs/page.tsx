'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function LogsRedirectPage() {
  useEffect(() => {
    // Redirect to the settings page where logs are now located.
    redirect('/dashboard/settings');
  }, []);

  return null; // This component will not render anything.
}
