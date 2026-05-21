import { useMemo, useState } from 'react';

const OneTimeCredentialsCard = ({ credentials, message, onClose }) => {
  const [copied, setCopied] = useState('');

  const credentialText = useMemo(() => {
    if (!credentials) return '';
    return [
      `Email: ${credentials.email}`,
      `Username: ${credentials.username}`,
      `Password: ${credentials.password}`,
    ].join('\n');
  }, [credentials]);

  if (!credentials) return null;

  const copyText = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch (error) {
      setCopied('');
    }
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent('Your account credentials');
    const body = encodeURIComponent(credentialText);
    window.location.href = `mailto:${credentials.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Credentials Created</h2>
          <p className="mt-1 text-sm text-gray-600">
            {message || 'User created successfully'}
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Password is shown only once. Copy or share it before closing.
          </div>

          {[
            ['Email', credentials.email],
            ['Username', credentials.username],
            ['Password', credentials.password],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-gray-200 p-3">
              <div className="mb-1 text-xs font-semibold uppercase text-gray-500">
                {label}
              </div>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 break-all rounded bg-gray-50 px-3 py-2 text-sm text-gray-900">
                  {value}
                </code>
                <button
                  type="button"
                  onClick={() => copyText(label, value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {copied === label ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => copyText('All', credentialText)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {copied === 'All' ? 'Copied All' : 'Copy All'}
          </button>
          <button
            type="button"
            onClick={shareByEmail}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Share by Email
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default OneTimeCredentialsCard;
