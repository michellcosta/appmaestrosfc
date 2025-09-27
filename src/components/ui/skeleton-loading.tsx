import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Componente base de skeleton
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-300 dark:bg-gray-600 ${className}`}
      {...props}
    />
  );
}

// Skeleton para avatar
export function AvatarSkeleton({ size = 'large' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32'
  };

  return (
    <Skeleton className={`${sizeClasses[size]} rounded-full`} />
  );
}

// Skeleton para texto
export function TextSkeleton({ lines = 1, width = 'full' }: { lines?: number; width?: string }) {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4'
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${widthClasses[width as keyof typeof widthClasses] || 'w-full'}`}
        />
      ))}
    </div>
  );
}

// Skeleton para estatísticas
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 text-center">
            <div className="animate-pulse">
              <Skeleton className="w-8 h-8 mx-auto mb-2 rounded" />
              <Skeleton className="h-6 w-8 mx-auto mb-2 rounded" />
              <Skeleton className="h-4 w-16 mx-auto rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Skeleton para conquistas
export function AchievementsSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-6 w-32 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="text-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <Skeleton className="w-8 h-8 mx-auto mb-2 rounded" />
              <Skeleton className="h-3 w-16 mx-auto mb-1 rounded" />
              <Skeleton className="h-3 w-12 mx-auto rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton para informações do usuário
export function UserInfoSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <AvatarSkeleton size="large" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <Skeleton className="h-8 w-48 mx-auto sm:mx-0 mb-2 rounded" />
              <Skeleton className="h-4 w-64 mx-auto sm:mx-0 rounded" />
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mt-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-16 mb-1 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-16 mb-1 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton para página completa
export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-4 pb-20">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm rounded-lg mb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <Skeleton className="h-6 w-24 mb-2 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </div>

      {/* User info skeleton */}
      <UserInfoSkeleton />

      {/* Stats skeleton */}
      <StatsSkeleton />

      {/* Achievements skeleton */}
      <AchievementsSkeleton />

      {/* Recent matches skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Skeleton className="w-12 h-12 mx-auto mb-4 rounded" />
            <Skeleton className="h-4 w-48 mx-auto rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Settings skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full rounded" />
        </CardContent>
      </Card>

      {/* Logout button skeleton */}
      <Skeleton className="h-10 w-full rounded" />
    </div>
  );
}

// Componente de loading com progresso
export function ProgressLoading({ 
  message = 'Carregando...', 
  progress = 0,
  showProgress = false 
}: { 
  message?: string; 
  progress?: number;
  showProgress?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        {showProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-blue-600">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
        {showProgress && (
          <div className="mt-2 w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de loading para upload
export function UploadLoading({ 
  fileName, 
  progress = 0 
}: { 
  fileName: string; 
  progress?: number;
}) {
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Processando: {fileName}
          </p>
          <div className="mt-1 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {Math.round(progress)}% concluído
          </p>
        </div>
      </div>
    </div>
  );
}

