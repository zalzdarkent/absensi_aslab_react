import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PasswordStrengthInputProps {
    id: string;
    name: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
    tabIndex?: number;
    autoComplete?: string;
}

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
    {
        label: 'At least 12 characters',
        test: (password) => password.length >= 12,
    },
    {
        label: 'At least 1 lowercase letter',
        test: (password) => /[a-z]/.test(password),
    },
    {
        label: 'At least 1 uppercase letter',
        test: (password) => /[A-Z]/.test(password),
    },
    {
        label: 'At least 1 number',
        test: (password) => /\d/.test(password),
    },
    {
        label: 'At least 1 special character',
        test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
];

export function PasswordStrengthInput({
    id,
    name,
    value = '',
    onChange,
    placeholder,
    className,
    required,
    tabIndex,
    autoComplete,
}: PasswordStrengthInputProps) {
    const [password, setPassword] = useState(value);
    const [showPassword, setShowPassword] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);

    useEffect(() => {
        setPassword(value);
    }, [value]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        onChange?.(newPassword);
    };

    const handleFocus = () => {
        setShowRequirements(true);
    };

    const handleBlur = () => {
        // Keep requirements visible if password is not empty or doesn't meet all requirements
        const allRequirementsMet = passwordRequirements.every(req => req.test(password));
        if (password === '' || allRequirementsMet) {
            setShowRequirements(false);
        }
    };

    const getPasswordStrength = () => {
        const metRequirements = passwordRequirements.filter(req => req.test(password)).length;
        if (metRequirements === 0) return { strength: 0, label: '', color: '' };
        if (metRequirements <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
        if (metRequirements <= 3) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
        if (metRequirements <= 4) return { strength: 3, label: 'Good', color: 'bg-blue-500' };
        return { strength: 4, label: 'Strong', color: 'bg-green-500' };
    };

    const { strength, label, color } = getPasswordStrength();

    return (
        <div className="space-y-3">
            <div className="relative">
                <Input
                    id={id}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={cn('pr-10', className)}
                    required={required}
                    tabIndex={tabIndex}
                    autoComplete={autoComplete}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                </Button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className={cn(
                            "font-medium",
                            strength === 1 && "text-red-600",
                            strength === 2 && "text-yellow-600",
                            strength === 3 && "text-blue-600",
                            strength === 4 && "text-green-600"
                        )}>
                            {label}
                        </span>
                    </div>
                    <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className={cn(
                                    "h-2 flex-1 rounded-full",
                                    level <= strength ? color : "bg-muted"
                                )}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Password Requirements */}
            {showRequirements && (
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                    <p className="text-sm font-medium text-foreground">Enter a password. Must contain:</p>
                    <div className="space-y-1">
                        {passwordRequirements.map((requirement, index) => {
                            const isMet = requirement.test(password);
                            return (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                    {isMet ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className={cn(
                                        isMet ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                        {requirement.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
