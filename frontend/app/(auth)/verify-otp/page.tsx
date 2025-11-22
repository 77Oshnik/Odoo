'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import api from '../../../lib/axios';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

const verifyOtpSchema = z.object({
    code: z.string().min(4, 'OTP must be at least 4 characters'),
});

type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<VerifyOtpFormValues>({
        resolver: zodResolver(verifyOtpSchema),
    });

    useEffect(() => {
        if (!email) {
            toast.error('Email is missing');
            router.push('/forgot-password');
        }
    }, [email, router]);

    const onSubmit = async (data: VerifyOtpFormValues) => {
        if (!email) return;
        setIsLoading(true);
        try {
            await api.post('/auth/verify-otp', { email, code: data.code });
            toast.success('OTP verified successfully');
            router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(data.code)}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Verify OTP
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter the OTP sent to {email}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <Label htmlFor="code">OTP Code</Label>
                            <Input
                                id="code"
                                type="text"
                                {...register('code')}
                                className={errors.code ? 'border-red-500' : ''}
                            />
                            {errors.code && (
                                <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
