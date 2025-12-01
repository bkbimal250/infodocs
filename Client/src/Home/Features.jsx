import { 
  HiOutlineDocumentText, 
  HiOutlineClipboardCheck,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineCog
} from 'react-icons/hi';

/**
 * Features Section Component
 * Displays key features and benefits of the platform
 */
const Features = () => {
  const features = [
    {
      icon: HiOutlineDocumentText,
      title: 'Certificate Management',
      description: 'Generate professional certificates with customizable templates and automated workflows.',
      color: 'blue'
    },
    {
      icon: HiOutlineClipboardCheck,
      title: 'Form Submission',
      description: 'Streamlined candidate and hiring form submission with real-time tracking.',
      color: 'green'
    },
    {
      icon: HiOutlineShieldCheck,
      title: 'Secure Storage',
      description: 'Enterprise-grade security ensures your documents are protected and accessible.',
      color: 'purple'
    },
    {
      icon: HiOutlineChartBar,
      title: 'Analytics & Reports',
      description: 'Comprehensive dashboards and insights to track your operations and performance.',
      color: 'orange'
    },
    {
      icon: HiOutlineUserGroup,
      title: 'Role-Based Access',
      description: 'Flexible permission system for admins, managers, HR, and users.',
      color: 'indigo'
    },
    {
      icon: HiOutlineCog,
      title: 'Customizable Workflows',
      description: 'Tailor the platform to match your organization\'s specific requirements.',
      color: 'pink'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600'
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Organizations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage documents, certificates, and workflows efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className={`${colorClasses[feature.color]} rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

