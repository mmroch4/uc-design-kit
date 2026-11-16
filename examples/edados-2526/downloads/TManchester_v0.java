// Estruturas de Dados - DCC/FCUP
// Abril/2012
//
// Problema 98 - Triagem de Manchester
// Solucao: Fernando Silva

import java.util.*;

//
// caracterizacao de um doente
// 
class Doente implements Comparable<Doente> {
    String   nome; // nome do doente
    int    codCor; // código da cor que lhe foi atribuída
    int  tChegada; // hora de chegada (em minutos) entre 0 e 1440
    int    tAtend; // tempo que demorara o atendimento (em minutos)
    int  tEntrada; // tempo em que comecou a ser atendido (em minutos)
    int   tEspera; // quanto tempo esperou
    int    tSaida; // tempo em que saiu do atendimento

    // construtor
    Doente(String n, int cor, int tc, int ta) {
        nome     = n;
	codCor   = cor;
        tChegada = tc;
	tAtend   = ta;
	tEntrada =  0;
	tEspera  =  0;
    }
    // atualiza tempo de entrada (em que foi atendido)
    public void atualizaAtendimento(int te, int ts) {
	tEntrada= te;
	tEspera = tEntrada - tChegada;
	tSaida = ts;
    }
    // --- Define prioridade de um doente, primeiro a cor e depois hora de chegada ---
    @Override
    public int compareTo(Doente outro) {
        // 1. ordena 1o por codigo de cor (0 ee maior prioridade)
        if (this.codCor != outro.codCor) {
            return Integer.compare(this.codCor, outro.codCor);
        }
        // 2. se necessario desempata por tempo de chegada (FCFS)
        return Integer.compare(this.tChegada, outro.tChegada);
    }
}
//
// Equipa de atendimento 
//
class Equipa {
    final int  eqID;  // ID da equipa; nao ee estritamente necessario
    int      tLivre;  // minuto em que fica livre
    int   tEntrada;   // minuto em comeca a ser atendido
    int    nDoentes;  // num. doentes atendidos
    int   tTotAtend;  // tempo total gasto em atendimento de doentes
    
    // construtor
    Equipa (int id) {
	eqID     = id;
	tLivre   =  0; // comeca livre: tempo 0
       tEntrada=    0;
	nDoentes =  0;
	tTotAtend=  0;
    }
    // atribui doente com maior prioridade a esta equipa
    void atendeDoente(Doente doi) {
	// CODIGo A COMPLETAR
    }
}


//
// classe principal com o main()
//
public class TManchester_v0 {
    public static final int ncores= 5;  // numero de prioridades
    public static String cores[] = {"Vermelho","Laranja","Amarelo","Verde","Azul"};   
    // indexOf(): dada uma cor retorna o indice da cor no vector
    public static int indexOf(String cor) {
	for (int i=0; i<ncores; i++) 
	    if (cor.equals(cores[i])) 
		return i;
	return -1; 
    }
    
    // metodo principal
    public static void main(String[] args) {
        Scanner kb = new Scanner(System.in);

	String nome;               // vars. para leitura dos 
	int pri, tchegada;         // dados de um doente
	int ctr[]= new int[ncores];// contagem dos doentes no input por cor 
	int ndoentes= 0;           // num de doentes no input
	int natendidos= 0;         // num. doentes ja atendidos
	int tduracao;
	
	// ler flag
        int flag = kb.nextInt();
	// ler num. de equipas de atendimento
	int nequipas = kb.nextInt();
	kb.nextLine();

	// fila com todos os doentes dados no input
	Queue<Doente> porAtender= new LinkedList<Doente>();
	
        // Leitura dos doentes que passam na triagem
	// asssume-se estar por ordem de tempo de chegada
        while (kb.hasNextLine()) {
	    Scanner kb1= new Scanner(kb.nextLine());
	    nome= kb1.next();
	    pri=indexOf(kb1.next());
	    tchegada= kb1.nextInt();
	    tduracao= kb1.nextInt();
	    porAtender.add(new Doente(nome,pri,tchegada,tduracao));
	    ctr[pri]++;  // frequencia de cores
	    ndoentes++;  // num doentes no input
        }
	
        // output flag 0
	if (flag==0) {
	    // contagem de quantos doentes por cor (pode ser feito logo na leitura)
	    // procurar maximo
	    // CODIGO
	    return;
	}
	// faz a simulacao do atendimento pelas equipas
	// para responder aas outras flags
	//

	// Sugestoes
	// definir uma fila de prioridade dos doentes em espera
	// adiciona à fila de prioridade todos doentes da triagem com tempo menor que o atual
	// definir um array com as equipas de atendimento
	// selecionar equipa de atendimento livre (menor tempo em que fica livre)
	// atende doente mais prioritario (vem da fila de prioridade)
	// adiciona doente atendido aa fila de atendidos
	// atualizar o tempo e número de atendidos

	
	if (flag==1) { 
	    // codigo flag 1
	}
	else if (flag==2) {
	    // codigo flag 2
	}
    }
}
