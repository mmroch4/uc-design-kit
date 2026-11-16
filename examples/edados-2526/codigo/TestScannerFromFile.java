// -----------------------------------------------------------
// Estruturas de Dados 2025/2026 (CC1007) - DCC/FCUP
// http://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/
// -----------------------------------------------------------
// Exemplo de utilizacao de Scanner a partir de um ficheiro
// Ultima alteracao: 04/02/2019
// -----------------------------------------------------------

import java.io.File; 
import java.io.IOException; 
import java.util.Scanner;

public class TestScannerFromFile {
  public static void main (String args[]) {
    try {
      File file = new File("./example.txt");
      Scanner fileIn = new Scanner(file);
      while( fileIn.hasNextLine() )
      	System.out.println(fileIn.nextLine());
    }	 
    catch (IOException e) { // Mais sobre a instrucao catch noutra aula
      System.out.println("File not found");
    }
  }	
}
