import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export const pageAnimations = trigger('pageAnimations', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const categoryAnimations = trigger('categoryAnimations', [
  transition(':enter', [
    query(':enter', [
      style({ opacity: 0, transform: 'scale(0.9)' }),
      stagger(100, [
        animate('500ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ], { optional: true })
  ])   
]);

export const featureAnimations = trigger('featureAnimations', [
  transition(':enter', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(-50px)' }),
      stagger(150, [
        animate('700ms cubic-bezier(0.25, 0.1, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateX(0)' })
        )
      ])
    ], { optional: true })
  ])
]);