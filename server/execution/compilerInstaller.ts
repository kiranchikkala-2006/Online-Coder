import { exec } from 'child_process';

let isInstalling = false;
let installPromise: Promise<boolean> | null = null;

export async function checkHostBinary(cmd: string): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`which ${cmd}`, { timeout: 1500 }, (error) => {
      resolve(!error);
    });
  });
}

export function isCompilerInstalling(): boolean {
  return isInstalling;
}

export async function autoBootstrapCompilers(): Promise<boolean> {
  if (isInstalling && installPromise) {
    return installPromise;
  }

  const hasJavac = await checkHostBinary('javac');
  const hasGpp = await checkHostBinary('g++');

  if (hasJavac && hasGpp) {
    return true;
  }

  console.log('[CompilerInstaller] Detected missing JDK/compilers. Starting background setup...');
  isInstalling = true;

  installPromise = new Promise((resolve) => {
    const installCmd =
      'DEBIAN_FRONTEND=noninteractive apt-get update -qq && ' +
      'DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ' +
      '-o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" ' +
      '--no-install-recommends openjdk-17-jdk-headless gcc g++ golang-go rustc php-cli kotlin';

    exec(installCmd, { timeout: 120000 }, (err) => {
      isInstalling = false;
      if (err) {
        console.warn('[CompilerInstaller] Background compiler installation encountered an error:', err.message);
        resolve(false);
      } else {
        console.log('[CompilerInstaller] Background OpenJDK 17 and GCC/G++ setup complete!');
        resolve(true);
      }
    });
  });

  return installPromise;
}
