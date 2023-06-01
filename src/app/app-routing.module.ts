import { NgModule, inject } from '@angular/core';
import { ROUTES, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { EmailConfirmationComponent } from './auth/email-confirmation/email-confirmation.component';
import { PagesComponent } from './pages/pages.component';
import { FindPageResolver } from './_resolvers/pages.resolver';
import { PreviewComponent } from './pages/preview/preview.component';
import { AuthGuard } from './_guards/auth.guard';
import { unauthGuard } from './_guards/unauth.guard';
import { AddPageComponent } from './pages/add-page/add-page.component';
import { ComponentsComponent } from './components/components.component';
import { AddComponentComponent } from './components/add-component/add-component.component';
import { WebBuilderComponent } from './pages/web-builder/web-builder.component';
import { PreviewComponentComponent } from './components/preview-component/preview-component.component';
import { FindComponentResolver, GetComponentsResolver } from './_resolvers/components.resolver';
import { NotFoundComponent } from './not-found/not-found.component';
import { PageService } from './_services/page.service';
import { GetPagesResponse } from './_responses/page.response';

const standardRoutes: Routes = [
  {
    path: "admin", children: [
      { path: "", redirectTo: "pages", pathMatch: "full" },
      {
        path: "", children: [
          { path: "login", component: LoginComponent },
          { path: "register", component: RegisterComponent },
          { path: "forgot-password", component: ForgotPasswordComponent },
          { path: "reset-password", component: ResetPasswordComponent },
          { path: "email-confirmation", component: EmailConfirmationComponent },
        ], canActivate: [unauthGuard]
      },
      {
        path: "", children: [
          { path: "web-builder/:id", component: WebBuilderComponent, resolve: { findPage: FindPageResolver, getComponents: GetComponentsResolver } },
          { path: "preview/:id", component: PreviewComponent, resolve: { findPage: FindPageResolver } },
          { path: "pages", component: PagesComponent },
          { path: "pages/add", component: AddPageComponent },
          { path: "components", component: ComponentsComponent },
          { path: "components/add", component: AddComponentComponent },
          { path: "components/:id/preview", component: PreviewComponentComponent, resolve: { findComponent: FindComponentResolver } },
        ], canActivate: [AuthGuard]
      },
    ]
  },
  { path: "**", component: NotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(standardRoutes, {
    initialNavigation: 'enabledBlocking'
  })],
  providers: [
    {
      provide: ROUTES,
      useFactory: () => {
        let routes: Routes = [];
        inject(PageService).getPages().subscribe({
          next: (value: GetPagesResponse) => {
            const pages = value.data;
            console.table(pages);

            pages.forEach(x => routes.push({ path: x.route, component: ComponentsComponent }));

          },
          error: (error) => console.log(error),
          complete: () => console.log('Tamamlandı')
        });

        return [
          ...routes,
          ...standardRoutes
        ];

      },
      multi: true
    }
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(private pageService: PageService) {
    // Rotaları dinamik olarak almak için servisi kullanın
    this.pageService.getPages().subscribe({
      next: (value: GetPagesResponse) => {
        const pages = value.data;
        console.table(pages);

        pages.forEach(x => standardRoutes.push({ path: x.route, component: ComponentsComponent }));
      },
      error: (error) => console.log(error),
      complete: () => RouterModule.forRoot(standardRoutes)
    });
  }
}
