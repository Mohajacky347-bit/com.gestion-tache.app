'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, Users, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'chef_section' | 'chef_brigade' | ''>('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!identifier || !password || !role) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setIsLoading(true)
    
    try {
      const success = await login(identifier, password, role as 'chef_section' | 'chef_brigade')
      
      if (success) {
        if (role === 'chef_section') {
          router.push('/')
        } else {
          router.push('/brigade')
        }
      } else {
        setError('Identifiant ou mot de passe incorrect')
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className={`absolute top-0 -left-40 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 ${mounted ? 'animate-pulse' : ''}`} style={{ animationDuration: '4s' }} />
        <div className={`absolute top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${mounted ? 'animate-pulse' : ''}`} style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className={`absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${mounted ? 'animate-pulse' : ''}`} style={{ animationDuration: '5s', animationDelay: '2s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating particles */}
        {mounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-6xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            {/* Left side - Branding */}
            <div className="text-white space-y-8 lg:pr-12">
              {/* Logo avec effet glow */}
              <div className={`transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 blur-3xl opacity-50 animate-pulse" />
                  <Image 
                    src="/fce.jpeg" 
                    alt="FCE Logo" 
                    width={200} 
                    height={200}
                    className="relative drop-shadow-2xl"
                  />
                </div>
              </div>

              <div className={`space-y-4 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-300">Depuis 1936</span>
                </div>
                
                <h1 className="text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                    Plateforme de
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Gestion FCE
                  </span>
                </h1>
                
                <p className="text-xl text-slate-300 leading-relaxed">
                  Une solution moderne et sécurisée pour gérer vos opérations quotidiennes avec efficacité
                </p>
              </div>

              <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-400/20 backdrop-blur-sm hover:border-blue-400/40 transition-all hover:scale-105 cursor-pointer">
                  <Shield className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold mb-2">Sécurité Optimale</h3>
                  <p className="text-sm text-slate-400">Chiffrement de bout en bout</p>
                </div>
                
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-400/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all hover:scale-105 cursor-pointer">
                  <Users className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold mb-2">Multi-Utilisateurs</h3>
                  <p className="text-sm text-slate-400">Gestion des rôles avancée</p>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className={`transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                {/* Card glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
                
                <div className="relative p-8 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Connexion
                    </h2>
                    <p className="text-slate-600">Accédez à votre espace de travail</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <Alert variant="destructive" className="bg-red-50 border-red-200 animate-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-slate-700 font-semibold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                        Rôle
                      </Label>
                      <Select 
                        value={role} 
                        onValueChange={(value) => setRole(value as 'chef_section' | 'chef_brigade')} 
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white hover:border-slate-300">
                          <SelectValue placeholder="Sélectionnez votre rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chef_section" className="cursor-pointer">
                            <div className="flex items-center gap-3 py-1">
                              <div className="p-2 rounded-lg bg-blue-50">
                                <Users className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium">Chef de Section</div>
                                <div className="text-xs text-slate-500">Gestion d'équipe</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="chef_brigade" className="cursor-pointer">
                            <div className="flex items-center gap-3 py-1">
                              <div className="p-2 rounded-lg bg-cyan-50">
                                <Shield className="h-4 w-4 text-cyan-600" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium">Chef de Brigade</div>
                                <div className="text-xs text-slate-500">Supervision terrain</div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="identifier" className="text-slate-700 font-semibold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                        Identifiant
                      </Label>
                      <Input
                        id="identifier"
                        type="text"
                        placeholder={role === 'chef_section' ? 'votre.email@fce.mg' : 'E010'}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700 font-semibold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                        Mot de passe
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="group relative w-full h-12 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white font-semibold text-base shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-600/50 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                      disabled={isLoading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          Se connecter
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                  
                  <div className="pt-6 border-t border-slate-200">
                    <p className="text-center text-xs text-slate-500">
                      Besoin d'aide ? Contactez le{' '}
                      <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                        support technique
                      </span>
                    </p>
                  </div>
                </div>
              </Card>
              
              <p className="text-center text-xs text-slate-400 mt-6">
                © 2026 FCE · Tous droits réservés · Excellence depuis 1936
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}