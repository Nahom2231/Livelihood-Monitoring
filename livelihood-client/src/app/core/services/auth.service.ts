import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  fullName?: string;
  role: string;
  branchCode: string | null;
  beneficiaryProfileId?: string | null;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: number;
  branchCode?: string;
  businessName?: string;
  livelihoodSector?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'lm_auth_token';
  private readonly userKey = 'lm_user_info';

  private readonly currentUserSignal = signal<AuthResponse | null>(this.getStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isStaff = computed(() => {
    const role = this.currentUserSignal()?.role;
    return role === 'SocialWorker' || role === 'BranchCoordinator' || role === 'HeadOfficeMAndE' || role === 'Admin';
  });
  readonly isBeneficiary = computed(() => this.currentUserSignal()?.role === 'Beneficiary');

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response));
        this.currentUserSignal.set(response);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  forgotPassword(username: string, newPassword?: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/forgot-password`, { username, newPassword });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem(this.userKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthResponse;
    } catch {
      return null;
    }
  }
}