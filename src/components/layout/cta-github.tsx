import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

export default function CtaGithub() {
  return (
    <Button variant='ghost' asChild size='sm' className='group hidden sm:flex'>
      <a
        href='https://sweo.se'
        rel='noopener noreferrer'
        target='_blank'
        className='dark:text-foreground transition-colors duration-300 hover:text-[#24292e] dark:hover:text-yellow-400'
      >
        <Github className='transition-transform duration-300 group-hover:animate-bounce' />
      </a>
    </Button>
  );
}
