import React, { useState } from 'react';
import { Button } from './ui/button';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface RouteButtonProps {
  address: string;
  className?: string;
}

export const RouteButton: React.FC<RouteButtonProps> = ({ address, className = '' }) => {
  const openGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(address);
    
    // URLs para app e web
    const appUrl = `comgooglemaps://?q=${encodedAddress}`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    // Detecta se está no mobile para usar esquemas de URL apropriados
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // No mobile, tenta abrir o app primeiro
      window.location.href = appUrl;
      
      // Fallback para web se o app não abrir
      setTimeout(() => {
        window.location.href = webUrl;
      }, 2000);
    } else {
      // No desktop, usa window.location.href para evitar popup blocker
      window.location.href = webUrl;
    }
  };

  const openWaze = () => {
    const encodedAddress = encodeURIComponent(address);
    
    // URLs para app e web
    const appUrl = `waze://?q=${encodedAddress}&navigate=yes`;
    const webUrl = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;
    
    // Detecta se está no mobile
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // No mobile, tenta abrir o app primeiro
      window.location.href = appUrl;
      
      // Fallback para web se o app não abrir
      setTimeout(() => {
        window.location.href = webUrl;
      }, 2000);
    } else {
      // No desktop, usa window.location.href para evitar popup blocker
      window.location.href = webUrl;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 ${className}`}
        >
          <Navigation className="w-4 h-4" />
          Abrir Rota
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={openGoogleMaps} className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Google Maps</span>
          <ExternalLink className="w-3 h-3 ml-auto text-zinc-400" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openWaze} className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-purple-600" />
          <span>Waze</span>
          <ExternalLink className="w-3 h-3 ml-auto text-zinc-400" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};