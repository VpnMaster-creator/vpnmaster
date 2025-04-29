import { useState } from 'react';
import { useRealVPN } from '@/hooks/use-real-vpn';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Check, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type IPTestResult = {
  withoutVPN: {
    ip: string;
    location: string;
    timestamp: string;
  } | null;
  withVPN: {
    ip: string;
    location: string;
    timestamp: string;
    vpn: boolean;
  } | null;
  loading: boolean;
};

export default function VPNTestPanel() {
  const { isConnected } = useRealVPN();
  const { toast } = useToast();
  const [testResult, setTestResult] = useState<IPTestResult>({
    withoutVPN: null,
    withVPN: null,
    loading: false
  });

  const handleTest = async () => {
    try {
      setTestResult({
        withoutVPN: null,
        withVPN: null,
        loading: true
      });

      // First test without VPN
      const originalResponse = await fetch('https://api.ipify.org?format=json');
      const originalData = await originalResponse.json();
      
      // Get rough location from a free service
      const geoResponse = await fetch(`https://ipapi.co/${originalData.ip}/json/`);
      const geoData = await geoResponse.json();
      
      const withoutVPN = {
        ip: originalData.ip,
        location: geoData.country_name || 'Unknown',
        timestamp: new Date().toISOString()
      };

      if (isConnected) {
        // Test with VPN - we'll use our proxy that routes through the selected server
        // The connectionId from localStorage is needed for the proxy to route correctly
        const connectionId = localStorage.getItem('vpn_connection_id');
        
        if (!connectionId) {
          toast({
            title: 'VPN Test Error',
            description: 'Connection ID not found. Try reconnecting to the VPN.',
            variant: 'destructive'
          });
          
          setTestResult({
            withoutVPN,
            withVPN: null,
            loading: false
          });
          return;
        }
        
        // Make request through our VPN tunnel
        const vpnResponse = await fetch(`/api/vpn-tunnel/ip-check?connectionId=${connectionId}`);
        const vpnData = await vpnResponse.json();
        
        setTestResult({
          withoutVPN,
          withVPN: vpnData,
          loading: false
        });
      } else {
        setTestResult({
          withoutVPN,
          withVPN: null,
          loading: false
        });
        
        toast({
          title: 'VPN Not Connected',
          description: 'Connect to the VPN to run a complete IP masking test.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('IP test error:', error);
      setTestResult({
        ...testResult,
        loading: false
      });
      
      toast({
        title: 'VPN Test Failed',
        description: error instanceof Error ? error.message : 'Could not complete VPN test',
        variant: 'destructive'
      });
    }
  };

  const ipsAreDifferent = testResult.withoutVPN && 
                          testResult.withVPN && 
                          testResult.withoutVPN.ip !== testResult.withVPN.ip;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">VPN IP Protection Test</h3>
        <Button
          onClick={handleTest}
          disabled={testResult.loading}
          variant="outline"
          className="gap-2"
        >
          {testResult.loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Run Test'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Without VPN */}
        <Card className="border-gray-700 bg-gray-900/50">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3 flex items-center text-amber-400">
              Without VPN
            </h4>
            
            {testResult.loading && !testResult.withoutVPN ? (
              <div className="h-20 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : testResult.withoutVPN ? (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 text-sm">IP Address:</span>
                  <span className="font-mono text-sm">{testResult.withoutVPN.ip}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 text-sm">Location:</span>
                  <span className="text-sm">{testResult.withoutVPN.location}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Your actual IP address is visible to websites
                </div>
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center text-gray-400 text-sm">
                Run the test to see your current IP
              </div>
            )}
          </CardContent>
        </Card>

        {/* With VPN */}
        <Card className="border-gray-700 bg-gray-900/50">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3 flex items-center text-green-400">
              With VPN
              {isConnected ? (
                <span className="ml-2 text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full">Connected</span>
              ) : (
                <span className="ml-2 text-xs px-2 py-0.5 bg-red-900/30 text-red-400 rounded-full">Disconnected</span>
              )}
            </h4>
            
            {!isConnected ? (
              <div className="h-20 flex flex-col gap-2 items-center justify-center text-gray-400 text-sm">
                <div>Connect to the VPN first</div>
                <X className="h-5 w-5 text-red-400" />
              </div>
            ) : testResult.loading && !testResult.withVPN ? (
              <div className="h-20 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : testResult.withVPN ? (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 text-sm">Masked IP:</span>
                  <span className="font-mono text-sm">{testResult.withVPN.ip}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 text-sm">Location:</span>
                  <span className="text-sm">{testResult.withVPN.location}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2 flex items-center">
                  {ipsAreDifferent ? (
                    <>
                      <Check className="h-3 w-3 text-green-500 mr-1" />
                      Your IP is now masked by MasterVPN
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-red-500 mr-1" />
                      IP masking not detected
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center text-gray-400 text-sm">
                Run the test to check VPN masking
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Results Summary */}
      {testResult.withVPN && testResult.withoutVPN && (
        <div className="mt-4 p-3 rounded-md border border-gray-700 bg-gray-900/30">
          <div className="flex items-center mb-2">
            <div className="font-medium">Test Results:</div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {new Date(testResult.withVPN.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm mb-1">IP Protection:</div>
              <div className="flex items-center">
                {ipsAreDifferent ? (
                  <>
                    <span className="text-green-400 font-medium flex items-center">
                      <Check className="h-4 w-4 mr-1" /> 
                      Protected
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      Your original IP is hidden
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-red-400 font-medium flex items-center">
                      <X className="h-4 w-4 mr-1" /> 
                      Not Protected
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      VPN is not masking your IP
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm mb-1">Location Change:</div>
              <div className="flex items-center">
                {testResult.withoutVPN.location !== testResult.withVPN.location ? (
                  <>
                    <span className="text-green-400 font-medium flex items-center">
                      <Check className="h-4 w-4 mr-1" /> 
                      Location Masked
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {testResult.withoutVPN.location} → {testResult.withVPN.location}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-400 font-medium flex items-center">
                      <X className="h-4 w-4 mr-1" /> 
                      Same Location
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      Location unchanged
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <a 
            href="https://whatismyipaddress.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-400 flex items-center mt-3 hover:underline"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Verify your IP with an external service
          </a>
        </div>
      )}
    </div>
  );
}