import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/services/api";

const FormDebug = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const handleTestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setDebugInfo(null);

        try {
            const formData = new FormData(e.target as HTMLFormElement);

            const data = {
                username: formData.get('username') as string,
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                password_confirm: formData.get('password') as string,
                first_name: formData.get('firstName') as string,
                last_name: formData.get('lastName') as string,
                qualification: formData.get('qualification') as string,
                experience_years: parseInt(formData.get('experience') as string) || 0,
                license_number: formData.get('license') as string,
                specialization: formData.get('specialization') as string,
                bio: formData.get('bio') as string || '',
                consultation_fee: parseFloat(formData.get('consultation_fee') as string) || 0.00,
            };

            console.log('🔍 Debug Form Data:', data);
            setDebugInfo({ step: 'form_data', data });

            // Test API call
            console.log('🚀 Testing API call...');
            const response = await apiClient.registerDoctor(data);

            console.log('✅ API Success:', response);
            setDebugInfo({ step: 'success', data, response });

        } catch (error) {
            console.error('❌ Debug Error:', error);
            setDebugInfo({ step: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Doctor Registration Debug Form</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleTestSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" name="username" defaultValue="debug_doctor" required />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" defaultValue="debug@example.com" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" name="firstName" defaultValue="Debug" required />
                                </div>
                                <div>
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" name="lastName" defaultValue="Doctor" required />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="qualification">Qualification</Label>
                                <Input id="qualification" name="qualification" defaultValue="BAMS" required />
                            </div>

                            <div>
                                <Label htmlFor="experience">Experience Years</Label>
                                <Input id="experience" name="experience" type="number" defaultValue="10" required />
                            </div>

                            <div>
                                <Label htmlFor="license">License Number</Label>
                                <Input id="license" name="license" defaultValue="LIC_DEBUG" required />
                            </div>

                            <div>
                                <Label htmlFor="specialization">Specialization</Label>
                                <select id="specialization" name="specialization" required className="w-full p-2 border rounded">
                                    <option value="general">General Ayurveda</option>
                                    <option value="nutrition">Ayurvedic Nutrition</option>
                                    <option value="panchakarma">Panchakarma</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="bio">Bio (Optional)</Label>
                                <Input id="bio" name="bio" defaultValue="Debug doctor" />
                            </div>

                            <div>
                                <Label htmlFor="consultation_fee">Consultation Fee</Label>
                                <Input id="consultation_fee" name="consultation_fee" type="number" defaultValue="500" />
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" defaultValue="testpass123" required />
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? "Testing..." : "Test Registration"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {debugInfo && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Debug Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default FormDebug;
